package TiniThink.Backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TiniThink.Backend.Model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
