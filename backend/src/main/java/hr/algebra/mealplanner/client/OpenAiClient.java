package hr.algebra.mealplanner.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import hr.algebra.mealplanner.exception.AiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Component
public class OpenAiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);

    private final RestClient restClient;
    private final String model;

    public OpenAiClient(
            @Value("${openai.base-url}") String baseUrl,
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public String chat(String systemPrompt, String userMessage) {
        ChatRequest request = new ChatRequest(model, List.of(
                new Message("system", systemPrompt),
                new Message("user", userMessage)
        ));

        try {
            ChatResponse response = restClient.post()
                    .uri("/v1/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new AiException("AI servis nije vratio odgovor");
            }
            return response.choices().get(0).message().content();

        } catch (RestClientResponseException e) {
            log.error("AI servis HTTP {} - tijelo: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiException("Greška u komunikaciji s AI servisom");
        } catch (RestClientException e) {
            log.error("AI servis greška: {}", e.getMessage(), e);
            throw new AiException("Greška u komunikaciji s AI servisom");
        }
    }

    record ChatRequest(String model, List<Message> messages) {
    }

    record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ChatResponse(List<Choice> choices) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {
    }
}