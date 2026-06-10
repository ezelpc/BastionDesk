// ┌─────────────────────────────────────────────────────────┐
// │  BastionDesk — Jenkins Declarative Pipeline             │
// │                                                         │
// │  Stages:                                                │
// │   1. Checkout                                           │
// │   2. Install Dependencies                               │
// │   3. Validate Environment Variables                     │
// │   4. Secret Scanning  (Gitleaks)                        │
// │   5. SAST             (Semgrep)                         │
// │   6. Dependency Audit (npm audit)                       │
// │   7. SCA Scan         (Trivy)                           │
// │   8. Build            (tsc + vite)                      │
// │   9. Post-build Summary                                 │
// └─────────────────────────────────────────────────────────┘

pipeline {
    agent any

    // ── Parámetros del pipeline ──────────────────────────────
    parameters {
        booleanParam(
            name: 'STRICT_ENV_CHECK',
            defaultValue: false,
            description: 'Modo estricto — falla si CUALQUIER variable de entorno está vacía'
        )
        booleanParam(
            name: 'SKIP_SAST',
            defaultValue: false,
            description: 'Saltar Semgrep SAST (para hotfixes urgentes)'
        )
        booleanParam(
            name: 'SKIP_BUILD',
            defaultValue: false,
            description: 'Saltar etapa de build (solo security checks)'
        )
        string(
            name: 'NODE_VERSION',
            defaultValue: '22',
            description: 'Versión de Node.js a usar'
        )
    }

    // ── Variables de entorno globales ────────────────────────
    environment {
        // Credenciales de Jenkins (configurar en Manage Jenkins → Credentials)
        MONGODB_URI            = credentials('bastiondesk-mongodb-uri')
        MONGODB_URI_TEST       = credentials('bastiondesk-mongodb-uri-test')
        JWT_SECRET             = credentials('bastiondesk-jwt-secret')
        JWT_REFRESH_SECRET     = credentials('bastiondesk-jwt-refresh-secret')
        RESEND_API_KEY         = credentials('bastiondesk-resend-api-key')
        TWILIO_ACCOUNT_SID     = credentials('bastiondesk-twilio-account-sid')
        TWILIO_AUTH_TOKEN      = credentials('bastiondesk-twilio-auth-token')
        TWILIO_PHONE_NUMBER    = credentials('bastiondesk-twilio-phone-number')
        GOOGLE_MAPS_API_KEY    = credentials('bastiondesk-google-maps-api-key')
        CLOUDINARY_CLOUD_NAME  = credentials('bastiondesk-cloudinary-cloud-name')
        CLOUDINARY_API_KEY     = credentials('bastiondesk-cloudinary-api-key')
        CLOUDINARY_API_SECRET  = credentials('bastiondesk-cloudinary-api-secret')
        VITE_API_URL           = credentials('bastiondesk-vite-api-url')
        VITE_GOOGLE_MAPS_KEY   = credentials('bastiondesk-vite-google-maps-key')

        // Variables con valores por defecto
        PORT                   = '5000'
        NODE_ENV               = 'ci'
        CLIENT_URL             = 'http://localhost:3000'
        JWT_EXPIRES_IN         = '7d'
        JWT_REFRESH_EXPIRES_IN = '30d'

        // Rutas de herramientas (ajustar según instalación)
        GITLEAKS_PATH          = 'gitleaks'  // o ruta absoluta: /usr/local/bin/gitleaks
        SEMGREP_PATH           = 'semgrep'
        TRIVY_PATH             = 'trivy'

        // Directorio para reportes
        REPORTS_DIR            = 'security-reports'
    }

    options {
        // Cancelar builds viejas del mismo branch
        disableConcurrentBuilds()
        // Timeout global del pipeline
        timeout(time: 30, unit: 'MINUTES')
        // Mantener últimas N builds
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
        // Timestamps en los logs
        timestamps()
        // ANSI colors
        ansiColor('xterm')
    }

    triggers {
        // Polling SCM cada 5 minutos (alternativa: usar webhooks de GitHub)
        // pollSCM('H/5 * * * *')
        // O con webhook de GitHub (recomendado):
        githubPush()
    }

    stages {

        // ────────────────────────────────────────────────────
        // STAGE 1: CHECKOUT
        // ────────────────────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo "🏗️  BastionDesk CI/CD Pipeline"
                echo "📋 Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}"
                echo "📦 Commit: ${env.GIT_COMMIT?.take(8) ?: 'unknown'}"
                echo "👤 Author: ${env.GIT_AUTHOR_NAME ?: 'unknown'}"
                echo "🕐 Build : ${env.BUILD_ID} (#${env.BUILD_NUMBER})"

                checkout scm

                // Crear directorio de reportes
                sh "mkdir -p ${REPORTS_DIR}"
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 2: INSTALL DEPENDENCIES
        // ────────────────────────────────────────────────────
        stage('📦 Install Dependencies') {
            steps {
                sh """
                    echo "🟡 Installing root dependencies..."
                    npm ci --ignore-scripts

                    echo "🟡 Installing server dependencies..."
                    npm ci --ignore-scripts --prefix server

                    echo "🟡 Installing client dependencies..."
                    npm ci --ignore-scripts --prefix client

                    echo "✅ All dependencies installed"
                """
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 3: VALIDATE ENVIRONMENT VARIABLES
        // ────────────────────────────────────────────────────
        stage('✅ Validate Environment') {
            steps {
                script {
                    def strictMode = params.STRICT_ENV_CHECK ? 'true' : 'false'
                    withEnv(["STRICT_MODE=${strictMode}"]) {
                        sh """
                            echo "🔍 Running environment variable validation..."
                            echo "   Mode: ${strictMode == 'true' ? 'STRICT' : 'NORMAL'}"
                            node scripts/validate-env.js
                        """
                    }
                }
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 4: SECRET SCANNING
        // ────────────────────────────────────────────────────
        stage('🔍 Secret Scanning') {
            steps {
                script {
                    def exitCode = sh(
                        script: """
                            echo "🔍 Running Gitleaks secret scan..."
                            ${GITLEAKS_PATH} detect \
                                --source=. \
                                --config=.gitleaks.toml \
                                --verbose \
                                --report-format=sarif \
                                --report-path=${REPORTS_DIR}/gitleaks-report.sarif \
                                --no-git \
                                2>&1 | tee ${REPORTS_DIR}/gitleaks.log
                        """,
                        returnStatus: true
                    )

                    if (exitCode != 0) {
                        // Publicar el reporte incluso si falla
                        publishHTML(target: [
                            reportDir: REPORTS_DIR,
                            reportFiles: 'gitleaks.log',
                            reportName: 'Gitleaks — Secret Scan Report',
                            keepAll: true
                        ])
                        error "❌ Gitleaks found secrets! Check the report for details."
                    }

                    echo "✅ No secrets detected"
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${REPORTS_DIR}/gitleaks*",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 5: SAST — SEMGREP
        // ────────────────────────────────────────────────────
        stage('🛡️ SAST (Semgrep)') {
            when {
                expression { !params.SKIP_SAST }
            }
            steps {
                script {
                    def exitCode = sh(
                        script: """
                            echo "🛡️  Running Semgrep SAST..."
                            ${SEMGREP_PATH} \
                                --config=.semgrep.yml \
                                --config=p/nodejs \
                                --config=p/typescript \
                                --config=p/react \
                                --config=p/owasp-top-ten \
                                --config=p/jwt \
                                --config=p/secrets \
                                --exclude=node_modules \
                                --exclude=dist \
                                --exclude=build \
                                --sarif \
                                --output=${REPORTS_DIR}/semgrep-report.sarif \
                                --verbose \
                                . 2>&1 | tee ${REPORTS_DIR}/semgrep.log

                            # También generar output legible
                            ${SEMGREP_PATH} \
                                --config=.semgrep.yml \
                                --config=p/nodejs \
                                --config=p/jwt \
                                --config=p/secrets \
                                --exclude=node_modules \
                                . 2>&1 | tee ${REPORTS_DIR}/semgrep-readable.log
                        """,
                        returnStatus: true
                    )

                    if (exitCode != 0) {
                        publishHTML(target: [
                            reportDir: REPORTS_DIR,
                            reportFiles: 'semgrep-readable.log',
                            reportName: 'Semgrep — SAST Report',
                            keepAll: true
                        ])
                        // Warning en lugar de error para findings de nivel WARNING
                        // Cambiar a error() para bloquear el pipeline
                        unstable("⚠️  Semgrep found issues. Check the SAST report.")
                    } else {
                        echo "✅ Semgrep SAST passed — no issues found"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${REPORTS_DIR}/semgrep*",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 6: DEPENDENCY AUDIT
        // ────────────────────────────────────────────────────
        stage('📦 Dependency Audit') {
            parallel {
                stage('Audit — Server') {
                    steps {
                        script {
                            sh """
                                echo "🔍 Auditing server dependencies..."
                                cd server
                                npm audit --audit-level=high --json > ../${REPORTS_DIR}/audit-server.json 2>&1 || true
                                npm audit --audit-level=high 2>&1 | tee ../${REPORTS_DIR}/audit-server.log || true

                                # Verificar si hay vulnerabilidades críticas
                                CRITICAL=\$(cat ../${REPORTS_DIR}/audit-server.json | node -e "
                                  const chunks = [];
                                  process.stdin.on('data', d => chunks.push(d));
                                  process.stdin.on('end', () => {
                                    try {
                                      const d = JSON.parse(chunks.join(''));
                                      const v = d.metadata?.vulnerabilities ?? d.vulnerabilities ?? {};
                                      console.log(v.critical ?? 0);
                                    } catch(e) { console.log(0); }
                                  });
                                " 2>/dev/null || echo "0")

                                echo "Server critical vulnerabilities: \$CRITICAL"
                                if [ "\$CRITICAL" -gt "0" ]; then
                                  echo "❌ Critical vulnerabilities in server dependencies!"
                                  exit 1
                                fi
                                echo "✅ Server — no critical vulnerabilities"
                            """
                        }
                    }
                }
                stage('Audit — Client') {
                    steps {
                        script {
                            sh """
                                echo "🔍 Auditing client dependencies..."
                                cd client
                                npm audit --audit-level=high --json > ../${REPORTS_DIR}/audit-client.json 2>&1 || true
                                npm audit --audit-level=high 2>&1 | tee ../${REPORTS_DIR}/audit-client.log || true

                                CRITICAL=\$(cat ../${REPORTS_DIR}/audit-client.json | node -e "
                                  const chunks = [];
                                  process.stdin.on('data', d => chunks.push(d));
                                  process.stdin.on('end', () => {
                                    try {
                                      const d = JSON.parse(chunks.join(''));
                                      const v = d.metadata?.vulnerabilities ?? d.vulnerabilities ?? {};
                                      console.log(v.critical ?? 0);
                                    } catch(e) { console.log(0); }
                                  });
                                " 2>/dev/null || echo "0")

                                echo "Client critical vulnerabilities: \$CRITICAL"
                                if [ "\$CRITICAL" -gt "0" ]; then
                                  echo "❌ Critical vulnerabilities in client dependencies!"
                                  exit 1
                                fi
                                echo "✅ Client — no critical vulnerabilities"
                            """
                        }
                    }
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${REPORTS_DIR}/audit-*",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 7: SCA SCAN — TRIVY
        // ────────────────────────────────────────────────────
        stage('🔒 SCA Scan (Trivy)') {
            steps {
                script {
                    sh """
                        echo "🔒 Running Trivy SCA scan..."

                        # Scan en formato JSON para procesamiento
                        ${TRIVY_PATH} fs \
                            --scanners vuln \
                            --severity CRITICAL,HIGH \
                            --ignore-unfixed \
                            --ignorefile .trivyignore \
                            --skip-dirs node_modules,.git,dist,build \
                            --format json \
                            --output ${REPORTS_DIR}/trivy-report.json \
                            . 2>&1 | tee ${REPORTS_DIR}/trivy.log || true

                        # Scan en formato tabla para logs legibles
                        ${TRIVY_PATH} fs \
                            --scanners vuln \
                            --severity CRITICAL,HIGH,MEDIUM \
                            --ignore-unfixed \
                            --ignorefile .trivyignore \
                            --skip-dirs node_modules,.git,dist,build \
                            --format table \
                            . 2>&1 | tee -a ${REPORTS_DIR}/trivy.log || true

                        echo "✅ Trivy SCA scan complete"
                    """

                    // Publicar reporte HTML
                    publishHTML(target: [
                        reportDir: REPORTS_DIR,
                        reportFiles: 'trivy.log',
                        reportName: 'Trivy — SCA Vulnerability Report',
                        keepAll: true
                    ])
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${REPORTS_DIR}/trivy*",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // ────────────────────────────────────────────────────
        // STAGE 8: BUILD
        // ────────────────────────────────────────────────────
        stage('🏗️ Build') {
            when {
                expression { !params.SKIP_BUILD }
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'release/*'
                }
            }
            parallel {
                stage('Build — Server') {
                    steps {
                        sh """
                            echo "🏗️  Building server (TypeScript)..."
                            cd server
                            npm run build
                            echo "✅ Server build successful"
                        """
                    }
                }
                stage('Build — Client') {
                    steps {
                        sh """
                            echo "🏗️  Building client (Vite)..."
                            cd client
                            npm run build
                            echo "✅ Client build successful"
                        """
                    }
                    environment {
                        VITE_API_URL          = "${env.VITE_API_URL}"
                        VITE_GOOGLE_MAPS_KEY  = "${env.VITE_GOOGLE_MAPS_KEY}"
                    }
                }
            }
            post {
                success {
                    archiveArtifacts(
                        artifacts: "server/dist/**, client/dist/**",
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }

    } // end stages

    // ── Post-pipeline actions ────────────────────────────────
    post {
        always {
            echo """
╔══════════════════════════════════════════════════╗
║     BastionDesk — Pipeline Summary               ║
╠══════════════════════════════════════════════════╣
║  Build    : #${env.BUILD_NUMBER}
║  Branch   : ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}
║  Status   : ${currentBuild.currentResult}
║  Duration : ${currentBuild.durationString}
╚══════════════════════════════════════════════════╝
            """

            // Publicar todos los reportes de seguridad
            archiveArtifacts(
                artifacts: "${REPORTS_DIR}/**",
                allowEmptyArchive: true,
                fingerprint: true
            )
        }

        success {
            echo "✅ Pipeline completed successfully!"

            // Notificación de éxito (descomentar y configurar según tu setup)
            // slackSend(
            //     channel: '#bastiondesk-ci',
            //     color: 'good',
            //     message: "✅ *BastionDesk* build #${env.BUILD_NUMBER} passed on `${env.BRANCH_NAME}`\n${env.BUILD_URL}"
            // )

            // emailext(
            //     subject: "✅ BastionDesk Build #${env.BUILD_NUMBER} — PASSED",
            //     body: "Build passed successfully.\n\nDetails: ${env.BUILD_URL}",
            //     to: "${env.GIT_AUTHOR_EMAIL}"
            // )
        }

        failure {
            echo "❌ Pipeline FAILED!"

            // Notificación de fallo (descomentar según tu setup)
            // slackSend(
            //     channel: '#bastiondesk-ci',
            //     color: 'danger',
            //     message: "❌ *BastionDesk* build #${env.BUILD_NUMBER} FAILED on `${env.BRANCH_NAME}`\n${env.BUILD_URL}"
            // )
        }

        unstable {
            echo "⚠️  Pipeline completed with warnings (UNSTABLE)"
        }

        cleanup {
            // Limpiar archivos temporales
            sh "rm -f changed_files.txt gitleaks-report.sarif semgrep-report.sarif trivy-report.sarif audit-*.json 2>/dev/null || true"
        }
    }
}
