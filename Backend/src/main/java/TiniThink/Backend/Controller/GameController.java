package TiniThink.Backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import TiniThink.Backend.Model.Choice;
import TiniThink.Backend.Model.Game;
import TiniThink.Backend.Model.Question;
import TiniThink.Backend.Repository.GameRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/game")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @PostMapping("/create")
    public Game createGame(@Valid @RequestBody Game game) {
    
        if (game.getQuestions() != null) {
            for (Question q : game.getQuestions()) {
                q.setGame(game); 
                if (q.getChoices() != null) {
                    for (Choice c : q.getChoices()) {
                        c.setQuestion(q); 
                    }
                }
            }
        }
        return gameRepository.save(game);
    }

    @GetMapping("/my-games")
    public List<Game> getMyGames(@RequestParam String creatorId) {
        return gameRepository.findByCreatorId(creatorId);
    }

    @DeleteMapping("/{id}") 
    public ResponseEntity<?> deleteGame(@PathVariable Long id) {
        if (!gameRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        gameRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    
}

