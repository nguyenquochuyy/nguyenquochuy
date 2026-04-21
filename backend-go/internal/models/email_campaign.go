package models

import "time"

type EmailCampaign struct {
	ID        string        `bson:"id" json:"id"`
	Name      string        `bson:"name" json:"name"`
	Subject   string        `bson:"subject" json:"subject"`
	Template  string        `bson:"template" json:"template"`
	TargetIDs []string      `bson:"targetIds" json:"targetIds"`
	Status    string        `bson:"status" json:"status"` // DRAFT|SCHEDULED|SENT|FAILED
	SentAt    *time.Time    `bson:"sentAt,omitempty" json:"sentAt,omitempty"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	Stats     CampaignStats `bson:"stats" json:"stats"`
}

type CampaignStats struct {
	Total   int `bson:"total" json:"total"`
	Sent    int `bson:"sent" json:"sent"`
	Failed  int `bson:"failed" json:"failed"`
	Opened  int `bson:"opened" json:"opened"`
	Clicked int `bson:"clicked" json:"clicked"`
}
