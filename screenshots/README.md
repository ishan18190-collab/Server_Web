# Postman assignment evidence

Captured directly from Postman Desktop on November 1, 2026, against the Express
server at http://localhost:5000 connected to MongoDB Atlas database `product_db`.

The collection runner completed **10 requests and 27 passing assertions**, with
**zero failed assertions and zero errors**. The individual requests were then run
again for the screenshots below. Expected 400 and 404 responses demonstrate error
handling and count as passing tests.

The test product was deleted at the end; the database contained zero products
after verification. These are actual application screenshots, not mockups.

## Collection run: all tests passed

![Postman collection run: 27 passing assertions](postman/11-collection-run-summary.jpg)

## 1. Health check - 200 OK

![Atlas-backed health check](postman/01-health-check.jpg)

## 2. Create product - 201 Created

![Create a Wireless Mouse product](postman/02-create-product.jpg)

## 3. Get all products - 200 OK

![List the saved product](postman/03-get-all-products.jpg)

## 4. Get product by ID - 200 OK

![Read the product by MongoDB ID](postman/04-get-product-by-id.jpg)

## 5. Update product - 200 OK

The request changes the price from 799 to 699 and inStock from true to false.

![Update the product price and stock](postman/05-update-product.jpg)

## 6. Missing required price - 400 Bad Request

![Reject a product without a price](postman/06-validation-error.jpg)

## 7. Invalid product ID - 400 Bad Request

![Reject a malformed MongoDB ID](postman/07-invalid-product-id.jpg)

## 8. Nonexistent product - 404 Not Found

![Return 404 for a valid but nonexistent ID](postman/08-product-not-found.jpg)

## 9. Delete product - 200 OK

![Delete the sample product](postman/09-delete-product.jpg)

## 10. Confirm deletion - 404 Not Found

![Verify that the deleted product no longer exists](postman/10-verify-deletion.jpg)

## Remaining database-view evidence

A MongoDB Compass screenshot has not been captured yet. To capture one, run
Create Product again, inspect `product_db.products` in Compass, and take a
screenshot of the document without exposing the connection string or password.
