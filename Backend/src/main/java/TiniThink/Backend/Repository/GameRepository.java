package TiniThink.Backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import TiniThink.Backend.Model.Game;

public interface GameRepository extends JpaRepository<Game, Long> {
	List<Game> findByCreatorId(String creatorId);
}
