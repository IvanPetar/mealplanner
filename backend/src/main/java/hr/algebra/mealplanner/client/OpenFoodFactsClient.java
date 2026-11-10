package hr.algebra.mealplanner.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.enums.FoodCategory;
import hr.algebra.mealplanner.repository.AllergenRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
public class OpenFoodFactsClient {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://world.openfoodfacts.org")
            .defaultHeader("User-Agent", "MealPlanner-Zavrsni/1.0")
            .build();

    private final AllergenRepository allergenRepository;

    public OpenFoodFactsClient(AllergenRepository allergenRepository) {
        this.allergenRepository = allergenRepository;
    }

    public Optional<Food> findByBarcode(String barcode) {
        try {
            OffResponse response = restClient.get()
                    .uri("/api/v2/product/{barcode}?fields=product_name,nutriments,image_small_url,categories_tags,allergens_tags", barcode)
                    .retrieve()
                    .body(OffResponse.class);

            if (response == null || response.status() != 1 || response.product() == null) {
                return Optional.empty();
            }
            return Optional.of(toFood(barcode, response.product()));
        } catch (RestClientException e) {
            return Optional.empty();
        }
    }

    public List<Food> searchByName(String query) {
        try {
            OffSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cgi/search.pl")
                            .queryParam("search_terms", query)
                            .queryParam("search_simple", 1)
                            .queryParam("action", "process")
                            .queryParam("json", 1)
                            .queryParam("page_size", 20)
                            .queryParam("fields", "code,product_name,nutriments,image_small_url,categories_tags,allergens_tags")
                            .build())
                    .retrieve()
                    .body(OffSearchResponse.class);

            if (response == null || response.products() == null) {
                return List.of();
            }

            return response.products().stream()
                    .filter(p -> p.productName() != null && !p.productName().isBlank())
                    .map(p -> toFood(p.code(), p))
                    .toList();
        } catch (RestClientException e) {
            return List.of();
        }
    }

    private Food toFood(String barcode, OffProduct product) {
        OffNutriments n = product.nutriments();
        Food food = new Food();
        food.setName(product.productName() != null ? product.productName() : "Nepoznat proizvod");
        food.setBarcode(barcode);
        food.setImageUrl(product.imageUrl());
        food.setCategory(categoryFromTags(product.categoriesTags()));
        food.setAllergens(allergensFromTags(product.allergensTags()));
        food.setCaloriesPer100g(nz(n == null ? null : n.energyKcal100g()));
        food.setProteinPer100g(nz(n == null ? null : n.proteins100g()));
        food.setCarbsPer100g(nz(n == null ? null : n.carbohydrates100g()));
        food.setFatPer100g(nz(n == null ? null : n.fat100g()));
        return food;
    }

    private double nz(Double value) {
        return value != null ? value : 0.0;
    }

    // Mapiranje OpenFoodFacts categories_tags u našu FoodCategory
    private FoodCategory categoryFromTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return FoodCategory.OTHER;
        }
        String joined = String.join(" ", tags).toLowerCase();

        if (containsAny(joined, "yogurt", "yoghurt", "milk", "dairy", "cheese")) {
            return FoodCategory.DAIRY;
        }
        if (containsAny(joined, "meat", "fish", "seafood", "poultry", "chicken", "beef", "pork", "egg", "ham", "sausage")) {
            return FoodCategory.PROTEIN;
        }
        if (containsAny(joined, "bread", "cereal", "pasta", "rice", "potato", "flour", "grain", "oat", "noodle")) {
            return FoodCategory.CARBS;
        }
        if (containsAny(joined, "vegetable")) {
            return FoodCategory.VEGETABLE;
        }
        if (containsAny(joined, "fruit")) {
            return FoodCategory.FRUIT;
        }
        if (containsAny(joined, "oil", "nut", "butter", "seed")) {
            return FoodCategory.FAT;
        }
        return FoodCategory.OTHER;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    // Mapiranje OpenFoodFacts allergens_tags (npr. "en:milk") u nazive iz našeg kataloga
    private static final Map<String, String> ALLERGEN_MAP = Map.ofEntries(
            Map.entry("gluten", "Gluten"),
            Map.entry("milk", "Mlijeko"),
            Map.entry("eggs", "Jaja"),
            Map.entry("nuts", "Orašasti plodovi"),
            Map.entry("peanuts", "Kikiriki"),
            Map.entry("soybeans", "Soja"),
            Map.entry("fish", "Riba"),
            Map.entry("crustaceans", "Rakovi"),
            Map.entry("molluscs", "Mekušci"),
            Map.entry("celery", "Celer"),
            Map.entry("mustard", "Senf"),
            Map.entry("sesame-seeds", "Sezam"),
            Map.entry("sulphur-dioxide-and-sulphites", "Sulfiti"),
            Map.entry("lupin", "Lupina")
    );

    private Set<Allergen> allergensFromTags(List<String> tags) {
        Set<Allergen> result = new HashSet<>();
        if (tags == null) {
            return result;
        }
        for (String tag : tags) {
            String key = tag.contains(":") ? tag.substring(tag.indexOf(':') + 1) : tag;
            String croName = ALLERGEN_MAP.get(key);
            if (croName != null) {
                allergenRepository.findByName(croName).ifPresent(result::add);
            }
        }
        return result;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OffResponse(int status, OffProduct product) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OffSearchResponse(List<OffProduct> products) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OffProduct(
            @JsonProperty("code") String code,
            @JsonProperty("product_name") String productName,
            @JsonProperty("image_small_url") String imageUrl,
            @JsonProperty("categories_tags") List<String> categoriesTags,
            @JsonProperty("allergens_tags") List<String> allergensTags,
            OffNutriments nutriments
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OffNutriments(
            @JsonProperty("energy-kcal_100g") Double energyKcal100g,
            @JsonProperty("proteins_100g") Double proteins100g,
            @JsonProperty("carbohydrates_100g") Double carbohydrates100g,
            @JsonProperty("fat_100g") Double fat100g
    ) {
    }
}