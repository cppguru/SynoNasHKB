#https://github.com/munhozdiego/SynoNasHKB
FROM tarampampam/node:13.1-alpine

RUN apk --no-cache --no-progress add git && \
cd /tmp && \
git clone https://github.com/munhozdiego/SynoNasHKB.git && \
cd SynoNasHKB && \
chmod a+x start.sh && \
npm install

# Entry point
ENTRYPOINT ["/tmp/SynoNasHKB/start.sh"]