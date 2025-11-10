package br.com.reaproveita.repositories;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.models.Usuario;
import br.com.reaproveita.enums.StatusAlimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlimentoRepository extends JpaRepository<Alimento, Long> {
    List<Alimento> findByStatus(StatusAlimento status);
    List<Alimento> findByDoador(Usuario doador);
}