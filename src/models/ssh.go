package models

type SSHReq struct {
	KeyType    string `form:"key_type" binding:"required"` // -t
	BitSize    int64  `form:"bit_size" binding:"required"` // -b
	Comment    string `form:"comment" binding:"required"`  // -C
	Name       string `form:"name"`                        // -f ~/.ssh/{name}
	Passphrase string `form:"passphrase"`                  // -N
	HashAlgo   string `form:"hash_algo"`                   // -E
	KeyFormat  string `form:"key_format"`                  // -m
}
