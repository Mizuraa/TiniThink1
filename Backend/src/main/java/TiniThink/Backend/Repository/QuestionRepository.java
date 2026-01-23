package TiniThink.Backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TiniThink.Backend.Model.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
