package handlers

import (
	"context"
	"fmt"
	"net/smtp"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type EmailCampaignHandler struct {
	col       *mongo.Collection
	custCol   *mongo.Collection
	emailUser string
	emailPass string
}

func NewEmailCampaignHandler(db *mongo.Database) *EmailCampaignHandler {
	return &EmailCampaignHandler{
		col:       db.Collection("email_campaigns"),
		custCol:   db.Collection("customers"),
		emailUser: os.Getenv("EMAIL_USER"),
		emailPass: os.Getenv("EMAIL_PASS"),
	}
}

func (h *EmailCampaignHandler) sendEmail(to, subject, body string) error {
	from := h.emailUser
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", from, to, subject, body)

	return smtp.SendMail(
		"smtp.gmail.com:587",
		smtp.PlainAuth("", from, h.emailPass, "smtp.gmail.com"),
		from,
		[]string{to},
		[]byte(msg),
	)
}

// POST /api/email-campaigns/create
func (h *EmailCampaignHandler) Create(c *gin.Context) {
	var campaign models.EmailCampaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	campaign.ID = fmt.Sprintf("EC%d", time.Now().UnixNano())
	campaign.Status = "DRAFT"
	campaign.CreatedAt = time.Now()
	campaign.Stats = models.CampaignStats{
		Total: len(campaign.TargetIDs),
	}

	if _, err := h.col.InsertOne(ctx, campaign); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.Created(c, campaign)
}

// POST /api/email-campaigns/:id/send
func (h *EmailCampaignHandler) Send(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var campaign models.EmailCampaign
	if err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&campaign); err != nil {
		utils.NotFound(c, "Không tìm thấy chiến dịch email")
		return
	}

	// Get customer emails
	cursor, err := h.custCol.Find(ctx, bson.M{"id": bson.M{"$in": campaign.TargetIDs}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var customerList []models.Customer
	if err = cursor.All(ctx, &customerList); err != nil {
		utils.InternalError(c, err)
		return
	}

	// Send emails using Gmail SMTP
	sentCount := 0
	failedCount := 0
	for _, customer := range customerList {
		if customer.Email != "" {
			if err := h.sendEmail(customer.Email, campaign.Subject, campaign.Template); err != nil {
				fmt.Printf("Failed to send email to %s: %v\n", customer.Email, err)
				failedCount++
			} else {
				sentCount++
			}
		} else {
			failedCount++
		}
	}

	// Update campaign status
	now := time.Now()
	_, err = h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{
		"$set": bson.M{
			"status":       "SENT",
			"sentAt":       now,
			"stats.sent":   sentCount,
			"stats.failed": failedCount,
		},
	})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("email_campaigns")
	utils.OK(c, gin.H{"message": "Đã gửi email thành công", "sent": sentCount, "failed": failedCount})
}

// GET /api/email-campaigns
func (h *EmailCampaignHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var campaigns []models.EmailCampaign
	if err = cursor.All(ctx, &campaigns); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, campaigns)
}

// DELETE /api/email-campaigns/:id
func (h *EmailCampaignHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("email_campaigns")
	utils.OK(c, gin.H{"message": "Đã xóa chiến dịch"})
}
