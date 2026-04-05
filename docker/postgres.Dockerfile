FROM postgres:16-alpine

LABEL maintainer="mehtrics"

# Set default locale
ENV LANG=en_US.UTF-8

EXPOSE 5432
