FROM debian:trixie

# Install packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl wget git jq unzip && \
    rm -rf /var/lib/apt/lists/*

# Create group gitline (gid 1000) and user gitline (uid 1000)
RUN groupadd --gid 1000 gitline && \
    useradd  --uid 1000 --gid 1000 --create-home --shell /bin/bash gitline

COPY --chown=gitline:gitline ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --chown=gitline:gitline ./sync.sh /home/gitline/sync.sh
RUN chmod +x /home/gitline/sync.sh

# Switch to the new user by default
USER gitline
WORKDIR /home/gitline

CMD ["/entrypoint.sh"]