package br.com.reaproveita.services;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.models.Reserva;
import br.com.reaproveita.models.Usuario;
import br.com.reaproveita.enums.StatusAlimento;
import br.com.reaproveita.enums.StatusReserva;
import br.com.reaproveita.repositories.AlimentoRepository;
import br.com.reaproveita.repositories.ReservaRepository;
import br.com.reaproveita.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private AlimentoRepository alimentoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Reserva criarReserva(Long idAlimento, Long idBeneficiario) {
        Optional<Alimento> alimentoOpt = alimentoRepository.findById(idAlimento);
        if (alimentoOpt.isEmpty()) {
            throw new RuntimeException("Alimento não encontrado");
        }

        Optional<Usuario> beneficiarioOpt = usuarioRepository.findById(idBeneficiario);
        if (beneficiarioOpt.isEmpty()) {
            throw new RuntimeException("Beneficiário não encontrado");
        }

        Alimento alimento = alimentoOpt.get();
        Usuario beneficiario = beneficiarioOpt.get();

        if (alimento.getStatus() != StatusAlimento.DISPONIVEL) {
            throw new RuntimeException("Este alimento não está mais disponível");
        }

        alimento.setStatus(StatusAlimento.RESERVADO);
        alimentoRepository.save(alimento);

        Reserva novaReserva = new Reserva();
        novaReserva.setAlimento(alimento);
        novaReserva.setBeneficiario(beneficiario);
        novaReserva.setDataReserva(LocalDateTime.now());
        novaReserva.setStatus(StatusReserva.PENDENTE);

        return reservaRepository.save(novaReserva);
    }

    @Transactional
    public Reserva confirmarColeta(Long idReserva) {
        Optional<Reserva> reservaOpt = reservaRepository.findById(idReserva);
        if (reservaOpt.isEmpty()) {
            throw new RuntimeException("Reserva não encontrada");
        }

        Reserva reserva = reservaOpt.get();

        if (reserva.getStatus() != StatusReserva.PENDENTE) {
            throw new RuntimeException("Esta reserva não pode ser confirmada (já foi concluída ou cancelada)");
        }

        reserva.setStatus(StatusReserva.CONCLUIDA);
        reserva.setDataRetiradaEfetiva(LocalDateTime.now());

        Alimento alimento = reserva.getAlimento();
        alimento.setStatus(StatusAlimento.COLETADO);

        alimentoRepository.save(alimento);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva cancelarReserva(Long idReserva) {
        Optional<Reserva> reservaOpt = reservaRepository.findById(idReserva);
        if (reservaOpt.isEmpty()) {
            throw new RuntimeException("Reserva não encontrada");
        }

        Reserva reserva = reservaOpt.get();
        Alimento alimento = reserva.getAlimento();

        reserva.setStatus(StatusReserva.CANCELADA);

        alimento.setStatus(StatusAlimento.DISPONIVEL);

        alimentoRepository.save(alimento);
        return reservaRepository.save(reserva);
    }

    public List<Reserva> listarPorBeneficiario(Long idBeneficiario) {
        Optional<Usuario> beneficiarioOpt = usuarioRepository.findById(idBeneficiario);
        if (beneficiarioOpt.isEmpty()) {
            throw new RuntimeException("Beneficiário não encontrado");
        }
        return reservaRepository.findByBeneficiario(beneficiarioOpt.get());
    }
}