package br.com.reaproveita.controllers;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.services.AlimentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alimentos")
@CrossOrigin(origins = "*")
public class AlimentoController {

    @Autowired
    private AlimentoService alimentoService;

    @PostMapping
    public ResponseEntity<Alimento> cadastrarAlimento(@RequestBody Alimento alimento,
                                                      @RequestParam Long idDoador) {
        try {
            Alimento novoAlimento = alimentoService.cadastrarAlimento(alimento, idDoador);
            return new ResponseEntity<>(novoAlimento, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Alimento>> listarDisponiveis() {
        List<Alimento> alimentos = alimentoService.listarDisponiveis();
        return ResponseEntity.ok(alimentos);
    }

    @GetMapping("/doador/{idDoador}")
    public ResponseEntity<List<Alimento>> listarPorDoador(@PathVariable Long idDoador) {
        try {
            List<Alimento> alimentos = alimentoService.listarPorDoador(idDoador);
            return ResponseEntity.ok(alimentos);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}