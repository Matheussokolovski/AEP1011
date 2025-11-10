package br.com.reaproveita.controllers;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.models.Reserva;
import br.com.reaproveita.services.AlimentoService;
import br.com.reaproveita.services.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping
    public ResponseEntity<Reserva> criarReserva(@RequestBody ReservaRequest reservaRequest) {
        try {
            Reserva novaReserva = reservaService.criarReserva(
                    reservaRequest.idAlimento(),
                    reservaRequest.idBeneficiario()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(novaReserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{idReserva}/confirmar")
    public ResponseEntity<Reserva> confirmarColeta(@PathVariable Long idReserva) {
        try {
            Reserva reserva = reservaService.confirmarColeta(idReserva);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{idReserva}/cancelar")
    public ResponseEntity<Reserva> cancelarReserva(@PathVariable Long idReserva) {
        try {
            Reserva reserva = reservaService.cancelarReserva(idReserva);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }



    private record ReservaRequest(Long idAlimento, Long idBeneficiario) {}
}