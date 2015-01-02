package main

import (
	"encoding/json"
	"io"
	"log"
	"os"

	"github.com/surma-dump/fbchatexport/tools/lib"
	"github.com/vincent-petithory/dataurl"
	"github.com/voxelbrain/goptions"
)

var (
	options = struct {
		ConversationFile *os.File      `goptions:"-c, --conversation, description='Conversation file', obligatory, rdonly"`
		Help             goptions.Help `goptions:"-h, --help, description='Show this help'"`
	}{}
)

func main() {
	goptions.ParseAndFail(&options)
	defer options.ConversationFile.Close()

	dec := json.NewDecoder(options.ConversationFile)
	var hdr lib.ConversationHeader
	if err := dec.Decode(&hdr); err != nil {
		log.Fatalf("Could not decode header: %s", err)
	}

	for {
		var msg lib.Message
		switch err := dec.Decode(&msg); err {
		case io.EOF:
			log.Printf("Done.")
			return
		case nil:
			if len(msg.Attachments.Data) <= 0 {
				continue
			}
			for _, at := range msg.Attachments.Data {
				du, err := dataurl.DecodeString(at.BinaryData)
				if err != nil {
					if len(at.BinaryData) > 20 {
						at.BinaryData = at.BinaryData[0:20]
					}
					log.Printf("Could not decode attachment of msg %s: %s (%#v)", msg.Id, err, at)
					continue
				}
				switch ct := du.ContentType(); ct {
				case "image/png":
					func() {
						f, err := os.Create(at.Name + ".png")
						if err != nil {
							log.Printf("Could not create file %s: %s", at.Name, err)
							return
						}
						defer f.Close()

						f.Write(du.Data)
					}()
				default:
					log.Printf("Unhandled content type %s", ct)
				}
			}
		default:
			log.Printf("Could not decode message: %s", err)
		}
	}
}
