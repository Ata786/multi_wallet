package com.banking.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {

    private static final String API_KEY = "f7b2e64386fc440a901226c26353ccd6";
    private static final String API_URL = "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=" + API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache rates for 10 minutes
    private Map<String, Double> cachedRates = new HashMap<>();
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    public Map<String, Double> getExchangeRates() {
        long currentTime = System.currentTimeMillis();

        // Return cached rates if still valid
        if (!cachedRates.isEmpty() && (currentTime - lastFetchTime) < CACHE_DURATION) {
            return cachedRates;
        }

        try {
            String response = restTemplate.getForObject(API_URL, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode rates = root.get("rates");

            Map<String, Double> newRates = new HashMap<>();
            rates.fields().forEachRemaining(entry -> {
                newRates.put(entry.getKey(), entry.getValue().asDouble());
            });

            cachedRates = newRates;
            lastFetchTime = currentTime;

            return cachedRates;
        } catch (Exception e) {
            // Return default rates if API fails
            if (!cachedRates.isEmpty()) {
                return cachedRates;
            }
            // Fallback rates
            Map<String, Double> fallback = new HashMap<>();
            fallback.put("USD", 1.0);
            fallback.put("EUR", 0.92);
            fallback.put("GBP", 0.79);
            fallback.put("INR", 83.0);
            fallback.put("JPY", 150.0);
            fallback.put("AUD", 1.53);
            fallback.put("CAD", 1.36);
            fallback.put("PKR", 281.0);
            return fallback;
        }
    }

    public double convert(double amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return amount;
        }

        Map<String, Double> rates = getExchangeRates();

        // All rates are relative to USD
        Double fromRate = rates.get(fromCurrency.toUpperCase());
        Double toRate = rates.get(toCurrency.toUpperCase());

        if (fromRate == null)
            fromRate = 1.0;
        if (toRate == null)
            toRate = 1.0;

        // Convert: amount in FROM currency -> USD -> TO currency
        double amountInUsd = amount / fromRate;
        double amountInTarget = amountInUsd * toRate;

        return Math.round(amountInTarget * 100.0) / 100.0; // Round to 2 decimal places
    }

    public double getExchangeRate(String fromCurrency, String toCurrency) {
        return convert(1.0, fromCurrency, toCurrency);
    }
}
