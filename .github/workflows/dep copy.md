name: Smart Build and Deploy FishStudio

on:
  push:
    branches:
      - main

jobs:
  # ==========================================
  # 1. API GATEWAY
  # ==========================================
  api-gateway:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[api-gateway]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push API Gateway
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/api-gateway/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/api-gateway:prod

  # ==========================================
  # 2. AUTH SERVICE
  # ==========================================
  auth-service:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[auth-service]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Auth Service
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/auth-service/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/auth-service:prod

  # ==========================================
  # 3. PRODUCT SERVICE
  # ==========================================
  product-service:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[product-service]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Product Service
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/product-service/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/product-service:prod

  # ==========================================
  # 4. ORDER SERVICE
  # ==========================================
  order-service:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[order-service]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Order Service
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/order-service/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/order-service:prod

  # ==========================================
  # 5. NOTIFICATION SERVICE
  # ==========================================
  notification-service:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[notification-service]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Notification Service
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/notification-service/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/notification-service:prod

  # ==========================================
  # 6. WORKER SERVICE
  # ==========================================
  worker-service:
    if: contains(github.event.head_commit.message, '[all]') || contains(github.event.head_commit.message, '[worker-service]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Worker Service
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/worker-service/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/worker-service:prod

  # ==========================================
  # 7. DEPLOY TO AWS EC2
  # ==========================================
  deploy-to-ec2:
    name: Deploy to AWS EC2
    needs:
      [
        api-gateway,
        auth-service,
        product-service,
        order-service,
        notification-service,
        worker-service,
      ]
    if: |
      always() &&
      !contains(needs.*.result, 'failure') &&
      !contains(needs.*.result, 'cancelled') &&
      contains(needs.*.result, 'success')
    runs-on: ubuntu-latest
    steps:
      - name: Decode Private Key Directly
        run: |
          echo "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBMG9vdkxSWnZzV0N1UG5TVUxmYjNkSlFRRlNONENFVVVCTlhwU1ZFOU1Rbll4TUhCbnJUTlVSdUZyaExRWlZqYW0wTlRuNGRCaGVGZXlUR3BoZVRybVdHaHhUVk5jbmc6cVZJVE9RMUljbXNYWTI0NFc5dFluRndSMjVycVpMS1JOV1ZIYVIzTFNYTXJMMExFTVZSVE1tcGFOMFdUVFU0WlRMTV9VTEZFTVdWRWRGb1FVblJ2ZFdSVmVHMlRGTkVTRVIwUWtkRVR0eUsyZHZVVEt4Y25vMFpHTlhWUndNa1paVkVNckdVUkJNMUZDU1ZGblpteEhad1MyVUkrbVhyMFRtbUdwVldHeHNMMlpvT0daM1V3OXlkZWRPTDNoNlJzWFpVWE5NWkhRd3dsdWVsQkpTaGRWWkV4TlNHMHlRVE4xTXl0TGJkWFZEUlVncG1LNUJkWE5JQ2xkbHpYSlhza3piZW81WnJMWWk5bmFFRnVlcEVNVlZjanBMTURmc1k5clYxSFZVUkFpYTVDdVZaWU5ERk9UMjFSU1RhelFra3pOdkNVMVlLQ3c1YQAzUjROMWhIYXRCcWFSU09WWV5VWElLZG5oRVpDNGdMbEJTbldWZGRvOURRVDFGSlJFRlJRVUpCYjAxQ1FVeVYzUnRha3dHZDFFblZaQlRBb3lVREpGZHoyWmpGNFVzdDBXSlpaTjNsdUFoTXpFjN4bFp6UHpadlpTbTJjellJMlpCU1NLUTRhdGRUWFF3ZER4ZGs1Y2tKRVFaV1pDSk5XUmlzZFdodldXVGx1YWVzZEdWUVdGaGVXRnlSRmxyVjJkYVJRSmxla3Q0ZFRmQU1Ya3JWRkpDVEk1TTJaZW5YdXpXZDBXRzFUVGV4dmZVS1oxaFF0SmwyZEdGODNUSkJRMyJ2QzNqM1JrnlhMDVCYXJWVFdVNGFqUnotV0xQdW1oYVhaUGFFRjNTRzFxTk9OSHMzVnliM3A2TWJKU0ZKSFlVSVBhQVBkbTljSU5aVVVOdVpaREV1WEV3Vm1ReXVaTVpWbVZNNkVtaHZqWjExVmpyWlRITVNWSWlZbnAwS09abU1JUmliRm5ibm1reVpabWJGaGNua0JtaERpOXpWRnZ1MnQwU1k5aExvWFh0MjJWWG52V1VObGVkM01FVmFjZXQxVUZabW5SeGRmUFB2WlBWblBGaFF3YVJSNmMwRlhnd0ZVVmdzRlZjVjJnMkU0UlVubldVQllaMHpDYWxhckRaWFpWUnFjbHVhREkyY0c0eU1HSW1lMTR6YWdZd1VOVVdFNzNlbVp5Y1hod01HSktWRVZkWjExRlFUWXJSb1lLTTIwVmhTVVJERDd1WXNWSlpkbUp2VjNnOUxPVWREblpuWldVenRxTGQ1VjwxUklOTW5lYno1WVU4cmREaVFtNU1WRU5JQ2RaUzJTTlRVRW5OVmMxTncxZGU0b1dKdnNWRVVuSG1yZG14VFlOWnBYUXBPTkVWdWJwbGVnSldnY1NOZnBxTUxGQ2RsbFRja2czVFU5VW5KaWNXdldLUjBScGNtNHMyVlFja1p3ZGxGemNpdDNST3MyTFpWY25hOTRXV0ZvT0dGNjFORVpaVU5IWkhKYU5GbDJjallWVU5OV0ZUM3pJclNndGVjbGFjMWg1YzBwbGRsdVZub0tiSE5QUTBwNlNscHlVRVJlU1duckVSVnlhM0ZJT1Zuc1UyUDJiVGxuZFRoUWpiRlJSYVd5Q1hkVGZJQ1lCd3JzR3RvUTJQZV00eWVkSGdNajVkd3BsWkRMWmVrUFJ6ZEZlZExVTlcxTVcxZlMzWndVdUhMTlRESkFua3pOT0pMRTlMTVJ4UldWbnlnMGQzVk9SV0pkd1BHUjJRUTNoU1B5Y2tvNE4xZExORU01MEhTM1BNSlpTSEQxRkxRbWRESE9FTnhlbGRNYVRMVllXUkpXRVNhYmdGWk1lcDNVVTlRUXV0MWxRd3NqRnpiMExNc0tZSyhPRU41TlZEYWF5dDNGZDNATkd0SGdtMTZWSFZVZENOSlMxSjJTRTRfUm5kREZoaFVTOXROMFJOZ1VEVVFLcDVSVGcxVmpudk1VT0hMWm5SaVdXWlpwQlJGRDptcGxvSFUzWTI5dGF4QnJjWGhWVFhWeURvVUlNTlhkYldRWVZZSjNWMnpycjFrVUtWblBOUTMwR2pXamYwZHpWcGVFclJEWVFaTXpDa1JvZERGQmJkQ1FVdE9SVEZvM1JtTTJ5YVVOM1lYbFpaV1ZIZFV3T1dJcmRtbGlkallRWFFyT1VVVDFJa1AwWVBPVUxPVEhfU21vckpPR21LYlRWMlRncFZ2TWhjRG54WkM5M1dHV3NidVhGeVl0VFJXRlRYaHRWWFJudkxMbFZka3MxTUZWT1JFWjBWaGRzQTI4aUVjNFZtZ3BYUXBObW0xRWBYRnlUa05JVFVRVlpIS3ZrNW5OVzFQUjBwS0wwdFVHbHhPZXBuY1ROWlNIWlpOakx4S3pNM1J4ZDRjaTBOTHMwdFIwVVNFSUZKVFFTQlF1a0xXUVJGSUVXU3AwdExTMApLS1MtLS0tLQo=" | base64 -d > private_key.pem
          chmod 600 private_key.pem

      - name: SSH and Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST_IP }}
          username: ubuntu
          key_path: private_key.pem
          script: |
            cd ~/fish-studio
            docker compose pull
            docker compose up -d
            docker image prune -f
