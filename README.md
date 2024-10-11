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