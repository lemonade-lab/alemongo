package password

import (
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// IsHashed performs a lightweight heuristic to determine if a password
// is already a bcrypt hash.
func IsHashed(p string) bool {
	if len(p) != 60 {
		return false
	}
	return strings.HasPrefix(p, "$2a$") || strings.HasPrefix(p, "$2b$") || strings.HasPrefix(p, "$2y$")
}

// HashPassword hashes a plain text password using bcrypt default cost.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// Compare compares stored (plain or hashed) with provided plain password.
// Returns (match, storedWasHashed).
func Compare(stored, provided string) (bool, bool) {
	if IsHashed(stored) {
		err := bcrypt.CompareHashAndPassword([]byte(stored), []byte(provided))
		return err == nil, true
	}
	return stored == provided, false
}
