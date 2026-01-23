package TiniThink.Backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "session_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SessionAnswer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="session_id")
    private GameSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="question_id")
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="player_id")
    private SessionPlayer player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="choice_id")
    private Choice choice;

    private Boolean isCorrect;
    private Instant answeredAt = Instant.now();
}
