Feature: First-time visitor explores the parish

  A continuous narrative walkthrough modeling how a first-time visitor
  discovers Sanctum Parish — landing on the home page, planning a visit,
  scanning the schedule and FAQs, reaching out via the contact form.

  Scenario: New visitor lands, plans a visit, sends a question
    Given I am on the home page
    When I pause for narration
    And I scroll down by 800 pixels
    And I scroll down by 1000 pixels
    When I navigate to "Visit" from the main nav
    Then I see the heading "Come as you are"
    When I pause for narration
    And I scroll to the "service" section
    And I scroll to the "faq" section
    And I click the "Contact Form" link
    Then the page title contains "Contact"
    When I fill the contact form with sample text
    And I select the "First-Time Visit" topic
    And I pause for narration
