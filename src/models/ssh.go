package models

type SSHReq struct {
	KeyType    string `form:"key_type"`   // -t
	BitSize    int64  `form:"bit_size"`   // -b
	Comment    string `form:"comment"`    // -C
	FilePath   string `form:"file_path"`  // -f
	Passphrase string `form:"passphrase"` // -N
	HashAlgo   string `form:"hash_algo"`  // -E
	KeyFormat  string `form:"key_format"` // -m
	Quiet      bool   `form:"quiet"`      // -q
}
