package main

import (
	"encoding/json"
	"io"
	"log"
	"os"
	"text/template"

	"github.com/surma-dump/fbchatexport/lib"
)

const Header = `
<!doctype html>
<style>
.message {
  margin: 10px auto;
  width: 800px;
}
.message header {
  background-color: #ddd;
}
.message header div {
  display: inline-block;
  margin: 0 10px;
}
.message aside img {
  max-height: 10vh;
  width: auto;
}
</style>
`

const MessageTemplate = `
  <div class="message">
    <header>
      <div class="author">{{.From.Name}}</div>
      <div class="timestamp">{{.CreatedTime}}</div>
    </header>
    <div class="message">{{.Message}}</div>
    <aside>
      {{range .Attachments.Data}}
        <img src="{{.BinaryData}}">
      {{end}}
    </aside>
  </div>
`

func main() {
	dec := json.NewDecoder(os.Stdin)

	hdr := lib.ConversationHeader{}
	if err := dec.Decode(&hdr); err != nil {
		log.Fatalf("Could not decode conversation header: %s", err)
	}

	tpl := template.New("")
	if _, err := tpl.Parse(MessageTemplate); err != nil {
		log.Fatalf("Could not compile template: %s", err)
	}

	os.Stdout.Write([]byte(Header))

	for {
		msg := lib.Message{}
		switch err := dec.Decode(&msg); err {
		case io.EOF:
			log.Printf("Done")
			return
		case nil:
			if err := tpl.Execute(os.Stdout, msg); err != nil {
				log.Fatalf("Could not execute template: %s", err)
			}
		default:
			log.Fatalf("Could not decode conversation message: %s", err)
		}
	}

}
