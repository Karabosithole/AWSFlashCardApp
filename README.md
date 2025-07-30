# AWS Flashcard App with AWS Translate

## Overview

This is a simple serverless web application that enables users to create and manage flashcards for learning concepts. Each flashcard is automatically translated into a user-selected language using AWS Translate. The app leverages AWS serverless technologies to provide a scalable, low-maintenance learning tool.

---

## Features

- Create flashcards with a term and definition in the user’s native language  
- Automatic translation of flashcards into a chosen target language using AWS Translate  
- View original and translated flashcards  
- Basic search/filter by language code  
- (Optional) Scheduled email reminders to review flashcards via AWS SES  

---

## AWS Architecture

- **Frontend:** Static website hosted on Amazon S3 and delivered via Amazon CloudFront  
- **API:** RESTful API powered by Amazon API Gateway + AWS Lambda functions  
- **Database:** DynamoDB to store flashcards and translations  
- **Translation Service:** AWS Translate for language translation  
- **Email Service:** Amazon SES for optional review reminder emails  
- **Event Scheduling:** AWS EventBridge (CloudWatch Events) to trigger scheduled tasks  
- **CI/CD:** AWS CodePipeline for continuous deployment  

---

## Getting Started

### Prerequisites

- AWS account with appropriate IAM permissions  
- AWS CLI installed and configured  
- Node.js and npm (for frontend and Lambda development)  
- AWS SAM CLI or Serverless Framework (optional for deployment)  

### Deployment Steps

1. Clone the repository  
2. Configure AWS CLI with your credentials and default region  
3. Deploy backend Lambda functions and API Gateway (via SAM or manual setup)  
4. Create DynamoDB table for flashcards  
5. Deploy frontend to S3 and configure CloudFront distribution  
6. (Optional) Configure SES and EventBridge for email reminders  
7. Use the frontend to create and review flashcards  

---

## Data Model (DynamoDB)

| Attribute           | Description                            |
|---------------------|------------------------------------|
| FlashcardID (PK)    | Unique identifier for each flashcard |
| Term                | Original term/text entered by user   |
| Definition          | Original definition/explanation      |
| TranslatedTerm      | Translated term text                  |
| TranslatedDefinition| Translated definition text           |
| LanguageCode        | Target language code (e.g., "es", "fr") |
| CreatedAt           | Timestamp of creation                 |
| UpdatedAt           | Timestamp of last update              |

---

## API Endpoints (Example)

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| POST   | /flashcards         | Create a new flashcard        |
| GET    | /flashcards         | List all flashcards           |
| GET    | /flashcards/{id}    | Retrieve specific flashcard   |
| PUT    | /flashcards/{id}    | Update flashcard              |
| DELETE | /flashcards/{id}    | Delete flashcard              |

---

## Future Enhancements

- User authentication and multi-user support via AWS Cognito  
- Flashcard tagging and categories  
- Spaced repetition algorithm for optimized review scheduling  
- Mobile-friendly frontend or Progressive Web App (PWA)  
- Enhanced analytics and usage reporting  

---

## Security Considerations

- Use IAM roles with least privilege for Lambda functions  
- Secure API Gateway with appropriate authorization mechanisms  
- Store AWS credentials securely and rotate regularly  
- (If implementing user auth) Use AWS Cognito or other secure identity providers  

---

## License

Specify your license here.

---
