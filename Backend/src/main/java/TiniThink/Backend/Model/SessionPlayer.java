package TiniThink.Backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "session_players")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SessionPlayer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private GameSession session;

    private Long userId;      // if logged in
    private String guestName; // if guest

    private Instant joinedAt = Instant.now();
    private Integer score = 0;
    private Integer lives = 3;
}
