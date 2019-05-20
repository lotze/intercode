class PagesController < ApplicationController
  # Cadmus::PagesController defines index, show, new, create, edit, update, and destroy actions for
  # CMS pages that include the cadmus_page directive.  So we don't need to implement those here;
  # instead we can just rely on the existing implementation, and override the protected methods in
  # Cadmus::PagesController as needed.
  #
  # We do have one special action Cadmus doesn't define, though: root.  This is for getting the
  # root page of a Convention (http://subdomain.interactiveliterature.org/).  Every Convention
  # has at least one page it defines as its root using the root_page association, so we'll need
  # to find it and get Cadmus to display it just as if it was showing some other page.

  include Cadmus::PagesController

  layout 'cms_page'

  # In the case of the root action, we'll need to load the root page from the database before
  # Authority has a chance to run its authorization checks.  So we use a before_action filter that
  # comes before authorize_actions_for in the chain.
  before_action :find_root_page, only: [:root]

  # Now it's safe to run authorize_actions_for.  We'll call out to the page_for_authorization
  # method to return the page we're using, and use read permissions for the root action.
  authorize_resource :page

  # If we're in the show action and being asked to show the root page, redirect to the domain
  # root URL.  Because pages should only have one canonical URL if possible, natch.
  before_action :redirect_if_root_page, only: [:show]

  # Intercode's layout uses the @page_title instance variable for the <title> tag.
  before_action :set_page_title, only: :show

  # We're going to do our own slightly more complicated check here, because pages can explicitly
  # skip the clickwrap check
  skip_before_action :ensure_clickwrap_agreement_accepted
  before_action :ensure_clickwrap_agreement_accepted_unless_page_skips_it

  # The actual root action implementation is exceedingly simple: since we've already loaded
  # @page in a before filter, we can just run the show action.  Sweet!
  def root
    show
  end

  protected

  def root_page
    @root_page ||= if parent_model
      parent_model.root_page
    else
      RootSite.instance.root_page
    end
  end

  # Set the @page variable if we're looking for the root page.  We expect a root page to exist on
  # the Convention.  If not, it's an error (which will become a 404).
  def find_root_page
    @page = root_page
    raise ActiveRecord::RecordNotFound unless @page
  end

  # Cadmus requires this too.  This method is supposed to return the parent object to look for pages
  # in, for this particular HTTP request.  We can simply use the convention method defined by this
  # controller's parent class (ApplicationController) to look up the appropriate Convention object
  # using the domain name for this HTTP request.
  def parent_model
    convention
  end

  # See above comment on the before_action for this.
  def redirect_if_root_page
    redirect_to root_url if @page == root_page
  end

  # See above comment on the before_action for this.
  def authorize_index
    authorize! :create, Page
  end

  def set_page_title
    @page_title = @page&.name
  end

  def render_page_content
    cms_rendering_context.render_page_content(@page)
  end
  helper_method :render_page_content

  def preload_cms_layout_content
    if @page
      super(@page.effective_cms_layout)
    else
      super
    end
  end

  def ensure_clickwrap_agreement_accepted_unless_page_skips_it
    return if @page.skip_clickwrap_agreement?
    ensure_clickwrap_agreement_accepted
  end
end