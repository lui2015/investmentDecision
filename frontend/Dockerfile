FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 子路径部署：与 vite.config.ts 的 base=/investmentDecision/ 保持一致
COPY dist/ /usr/share/nginx/html/investmentDecision/
EXPOSE 80
