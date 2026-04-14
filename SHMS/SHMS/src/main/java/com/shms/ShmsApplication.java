package com.shms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ShmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShmsApplication.class, args);
	}

}
