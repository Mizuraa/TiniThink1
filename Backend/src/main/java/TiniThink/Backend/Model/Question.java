package TiniThink.Backend.Model;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty
    private String text;

    private Integer timeLimit;

    @ManyToOne
    @JoinColumn(name = "game_id")
    @JsonBackReference
    private Game game;

    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Choice> choices;

    
}