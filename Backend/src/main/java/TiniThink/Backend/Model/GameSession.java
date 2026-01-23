package TiniThink.Backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "game_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GameSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="game_id")
    private Game game;

    private Integer joinCode; // numeric 6-digit

    private Long hostId; // optional

    private Instant createdAt = Instant.now();

    private Instant startedAt;

    private Boolean finished = false;
}
