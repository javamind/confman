package com.ninjamind.confman;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * CORS access control headers in its response,
 * @author Guillaume EHRET
 */
@Component
public class SimpleCORSFilter implements Filter {

    @Autowired
    private Integer serverPort;

    @Autowired
    private String serverHostname;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }


    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;

        res.setHeader("Access-Control-Allow-Origin", String.format("http://%s:%d", serverHostname, serverPort));

        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
        res.setHeader("Access-Control-Max-Age", "3600");
        res.addHeader("Access-Control-Allow-Headers","Authorization, content-type, Origin, accept, X-Requested-With, Access-Control-Request-Method,Access-Control-Request-Headers");
        res.setHeader("Access-Control-Expose-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Credentials, accept");

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }
}
