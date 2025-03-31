
![](demo_gif.gif)

# Stand by
Due to legal issues and the complexity to generate assets for the game, I have to put it into stand by

# Dev
To launch as dev:

```
sudo docker compose -f docker-compose-dev.yml up --build
```

To launch front as dev, go to virtualguessr_front, and:

```
npm start
```

To export libs for backend:

```
pdm export --no-hashes -f requirements -o requirements.txt
```


# Sending to prod for a new server
# VirtualGuessr

Configure firewall

```sql
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Add id_rsa to vps

```sql
ssh-copy-id root@vps219773.ovh.net
```

Configure conf /etc/ssh/sshd_config

```sql
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
```

```sql
sudo systemctl restart sshd
```

Install fail2ban

```sql
sudo apt install fail2ban
```


For certificates, at first launch it will not work, as there is none.
You must then have to:
```
docker compose down
```

Then change nginx default.conf to

```
server {
    listen 80;
    server_name virtualguessr.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
docker compose up -d nginx
```
server {
    listen 80;
    server_name virtualguessr.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Then relaunch everything (use a CI to do so for example)
