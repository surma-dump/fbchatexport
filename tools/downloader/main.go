package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	fb "github.com/huandu/facebook"
	"github.com/surma-dump/fbchatexport/lib"
	"github.com/vincent-petithory/dataurl"
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
			for i, a := range msg.Attachments.Data {
				log.Printf("Downloading attachment...")
				req, _ := http.NewRequest("GET", a.ImageData.URL, nil)
				req.Close = true
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					log.Printf("Error downloading attachment: %s", err)
					continue
				}
				data, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Printf("Error reading attachment: %s", err)
				}
				log.Printf("Done")
				du := dataurl.New(data, a.MimeType)
				msg.Attachments.Data[i].BinaryData = du.String()
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
