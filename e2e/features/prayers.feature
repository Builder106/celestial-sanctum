Feature: Prayer wall is publicly readable; posting requires sign-in

  The prayer wall (/prayers) is public-read, so anyone can see it, but the
  compose form only appears for signed-in members — signed-out visitors get a
  sign-in prompt instead. Firebase isn't configured in CI, so the member state
  here is always "signed out".

  Scenario: A visitor can read the prayer wall
    Given I am on the "/prayers" page
    Then I see the heading "Bear one another's burdens"
    And the page title contains "Prayer Wall"

  Scenario: Posting a prayer requires signing in
    Given I am on the "/prayers" page
    Then I see the text "Sign in to share a prayer request"
    And I see the text "Sign in to post"
