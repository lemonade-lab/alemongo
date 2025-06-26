package models

type SSHReq struct {
	KeyType    string `form:"key_type"`   // -t
	BitSize    int64  `form:"bit_size"`   // -b
	Comment    string `form:"comment"`    // -C
	Name       string `form:"name"`       // -f ~/.ssh/{name}
	Passphrase string `form:"passphrase"` // -N
	HashAlgo   string `form:"hash_algo"`  // -E
	KeyFormat  string `form:"key_format"` // -m
}
