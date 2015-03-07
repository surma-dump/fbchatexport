package lib

type ConversationHeader struct {
	Id           string `json:"id"`
	MessageCount int    `json:"message_count"`
	UpdatedTime  string `json:"updated_time"`

	Participants struct {
		Data []Participant `json:"data"`
	} `json:"participants"`
}

type Participant struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

type Message struct {
	Id          string      `json:"id"`
	CreatedTime string      `json:"created_time"`
	From        Participant `json:"from"`
	Message     string      `json:"message"`

	Attachments struct {
		Data []Attachment `json:"data"`
	} `json:"attachments"`
	To struct {
		Data []Participant `json:"data"`
	} `json:"to"`
	Tags struct {
		Data []Tag `json:"data"`
	} `json:"tags"`
}

type Attachment struct {
	Id         string `json:"id"`
	MimeType   string `json:"mime_type"`
	Name       string `json:"name"`
	BinaryData string `json:"binary_data"`
	ImageData  struct {
		Width      int    `json:"width"`
		Height     int    `json:"height"`
		MaxWidth   int    `json:"max_width"`
		MaxHeight  int    `json:"max_height"`
		URL        string `json:"url"`
		PreviewURL string `json:"preview_url"`
	} `json:"image_data"`
}

type Tag struct {
	Name string `json:"name"`
}
