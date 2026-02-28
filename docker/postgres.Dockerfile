FROM postgres:16-alpine

LABEL maintainer="mehtrics"

# Set default locale
ENV LANG=en_US.UTF-8

# Optional: add any pg extensions here via initdb scripts
COPY ./init-db.sh /docker-entrypoint-initdb.d/init-db.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh

EXPOSE 5432
