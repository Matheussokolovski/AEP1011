package br.com.reaproveita.repositories;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.models.Reserva;
import br.com.reaproveita.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByBeneficiario(Usuario beneficiario);
    Optional<Reserva> findByAlimentoAndStatus(Alimento alimento, br.com.reaproveita.enums.StatusReserva status);
}