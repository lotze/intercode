ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require "minitest/reporters"
Minitest::Reporters.use!(
  Minitest::Reporters::SpecReporter.new,
  ENV,
  Minitest.backtrace_filter
)

DatabaseCleaner.strategy = :transaction

class ActiveSupport::TestCase
  before(:each) { DatabaseCleaner.start }
  after(:each) { DatabaseCleaner.clean }
end

class ActionController::TestCase
  include Devise::Test::ControllerHelpers

  def set_convention(convention)
    @request.host = convention.domain
    @controller.request.env["intercode.convention"] = convention
  end
end

