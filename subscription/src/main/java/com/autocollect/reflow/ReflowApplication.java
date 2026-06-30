package com.autocollect.reflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.autocollect.reflow")
public class ReflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReflowApplication.class, args);
    }
}