package br.com.reaproveita.services;

import br.com.reaproveita.models.Alimento;
import br.com.reaproveita.models.Usuario;
import br.com.reaproveita.enums.StatusAlimento;
import br.com.reaproveita.repositories.AlimentoRepository;
import br.com.reaproveita.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlimentoService {

    @Autowired
    private AlimentoRepository alimentoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Alimento cadastrarAlimento(Alimento alimento, Long idDoador) {
        Optional<Usuario> doadorOpt = usuarioRepository.findById(idDoador);
        if (doadorOpt.isEmpty()) {
            throw new RuntimeException("Doador não encontrado com ID: " + idDoador);
        }

        alimento.setDoador(doadorOpt.get());
        alimento.setDataPostagem(LocalDateTime.now());
        alimento.setStatus(StatusAlimento.DISPONIVEL);

        return alimentoRepository.save(alimento);
    }

    public List<Alimento> listarDisponiveis() {
        return alimentoRepository.findByStatus(StatusAlimento.DISPONIVEL);
    }

    public List<Alimento> listarPorDoador(Long idDoador) {
        Optional<Usuario> doadorOpt = usuarioRepository.findById(idDoador);
        if (doadorOpt.isEmpty()) {
            throw new RuntimeException("Doador não encontrado com ID: " + idDoador);
        }
        return alimentoRepository.findByDoador(doadorOpt.get());
    }

    public Optional<Alimento> buscarPorId(Long id) {
        return alimentoRepository.findById(id);
    }
}