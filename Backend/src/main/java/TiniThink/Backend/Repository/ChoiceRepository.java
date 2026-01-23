package TiniThink.Backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TiniThink.Backend.Model.Choice;

public interface ChoiceRepository extends JpaRepository<Choice, Long> {
}
