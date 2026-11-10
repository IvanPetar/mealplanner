package hr.algebra.mealplanner.controller.mobile;

import hr.algebra.mealplanner.dto.response.ScanResponse;
import hr.algebra.mealplanner.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/scan")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    @GetMapping("/{barcode}")
    public ResponseEntity<ScanResponse> scan(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable String barcode) {
        return ResponseEntity.ok(scanService.scan(userDetails.getUsername(), barcode));
    }
}