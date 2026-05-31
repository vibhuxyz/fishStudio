1. when seller create store and login he can't see his store id and store
2.
 hy 



deploy-to-droplet:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: SSH and Update
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/apps/fish-studio
            docker compose pull
            docker compose up -d
            docker image prune -f
