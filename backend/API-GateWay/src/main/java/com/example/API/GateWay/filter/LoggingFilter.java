package com.example.API.GateWay.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;

import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;


@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().toString();

        log.info("Incoming Request -> {} {}", method, path);

        return chain.filter(exchange).then(
                Mono.fromRunnable(() -> {
                    int status = exchange.getResponse().getStatusCode().value();
                    log.info("Response Status -> {}", status);
                })
        );
    }

    @Override
    public int getOrder() {
        return -1;
    }
}