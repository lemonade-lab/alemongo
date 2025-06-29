package models

type SSHReq struct {
	KeyType    string `form:"key_type" json:"key_type" binding:"required"` // -t
	BitSize    int64  `form:"bit_size" json:"bit_size" binding:"required"` // -b
	Comment    string `form:"comment" json:"comment" binding:"required"`   // -C
	Name       string `form:"name" json:"name"`                            // -f ~/.ssh/{name}
	Passphrase string `form:"passphrase" json:"passphrase"`                // -N
	HashAlgo   string `form:"hash_algo" json:"hash_algo"`                  // -E
	KeyFormat  string `form:"key_format" json:"key_format"`                // -m
}
