package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"

	fb "github.com/huandu/facebook"
	"github.com/surma-dump/fbchatexport/lib"
)

var (
	token  = flag.String("token", "", "Facebook OAuth token (use explorer)")
	convId = flag.String("convId", "", "ID of conversation")
)

func main() {
	flag.Parse()

	if *token == "" {
		log.Fatalf("-token has to be defined")
	}
	if *convId == "" {
		log.Fatalf("-convId has to be defined")
	}

	session := (&fb.App{}).Session(*token)
	res, err := session.Get("/"+*convId+"/messages", fb.Params{})
	if err != nil {
		log.Fatalf("Error requesting conversation list: %s", err)
	}
	pres, err := res.Paging(session)
	if err != nil {
		log.Fatalf("Could not do paging: %s", err)
	}
	enc := json.NewEncoder(os.Stdout)
	for {
		log.Printf("Parsing page...")
		ress := pres.Data()
		for _, res := range ress {
			msg := lib.Message{}
			if err := res.DecodeField("", &msg); err != nil {
				log.Printf("Error decoding messages: %s", err)
				continue
			}
			enc.Encode(msg)
		}
		if !pres.HasNext() {
			break
		}
		_, err := pres.Next()
		if err != nil {
			log.Fatalf("Error getting next page: %s", err)
		}
	}
}
