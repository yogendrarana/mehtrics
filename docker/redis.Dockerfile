FROM redis:7-alpine

LABEL maintainer="mehtrics"

# Enable persistence (AOF)
RUN echo "appendonly yes" >> /usr/local/etc/redis/redis.conf
RUN echo "appendfsync everysec" >> /usr/local/etc/redis/redis.conf
RUN echo "maxmemory 256mb" >> /usr/local/etc/redis/redis.conf
RUN echo "maxmemory-policy allkeys-lru" >> /usr/local/etc/redis/redis.conf

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
