from flask import Flask, render_template, request, flash, jsonify, redirect, url_for, session
import mysql.connector
from config import Config
from random import randint
from datetime import timedelta





app = Flask(__name__)
app.config.from_object(Config)  # Load configuration from config.py

# Database connection
db = mysql.connector.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    password=app.config['MYSQL_PASSWORD'],
    database=app.config['MYSQL_DB']
)
if db.is_connected():
    print("✅ Database connected successfully!")
else:
    print("❌ Unable to connect to the database!")
cursor = db.cursor()

app.permanent_session_lifetime = timedelta(days=7)



@app.route('/')
def check_website_status():
    cursor.execute("SELECT id, is_active, reason FROM website_status LIMIT 1")
    status = cursor.fetchone()

    if status:
        id_, is_active, reason = status

        if is_active == 0:
            # Show reason why site is inactive
            return f"<h1>🚧 Website is under maintenance: {reason}</h1>"
        else:
            # Normal operation (e.g., show signup page or home)
            if 'mobile' in session:
                return redirect(url_for('dashboard'))
            else : 
                return redirect(url_for('signup'))
    else:
        return "❌ No status found in database."

# When user visits the signup page (GET)
@app.route('/signup', methods=['GET'])
def signup():
    return render_template('signup.html')

def random_with_N_digits(n):
      range_start = 10**(n-1)
      range_end = (10**n)-1
      return randint(range_start, range_end)

@app.route('/api/balance', methods=['GET'])
def get_balance():
    if 'mobile' in session:
        try:
            mobile = session['mobile']
            cursor = db.cursor()
            cursor.execute("SELECT balance FROM users WHERE mobile = %s", (mobile,))
            result = cursor.fetchone()
            cursor.close()

            if result and result[0] is not None:
                return jsonify({'balance': result[0]})
            else:
                return jsonify({'balance': 0})
        except Exception as e:
           
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'User not logged in'}), 401


# When user submits the signup form (POST)
@app.route('/signup', methods=['POST'])
def register():
    
    id = random_with_N_digits(6)
    name = request.form['name']
    mobile = request.form['mobile']
    email = request.form['email']
    password = request.form['password']
    balance = 250
    # check if id already exists
    while True :
        cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
        user = cursor.fetchone()
        if user is None: 
            break
        id = random_with_N_digits(6)

    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE mobile = %s", (mobile,))
    user = cursor.fetchone() 

    if user:
        # User already exists
        flash('Mobile number already exists! Please login.')
        return redirect(url_for('signup'))
    
    # Insert new user into database
    sql = "INSERT INTO users (name, id, mobile, email, password, balance) VALUES (%s, %s, %s, %s, %s, %s)"
    val = (name, id, mobile, email, password, balance)
    cursor.execute(sql, val)
    session.permanent = True
    session['mobile'] = mobile  # Store mobile in session
    session['name'] = name
    session['id'] = id
    
    db.commit()

    # After signup, redirect to login page
    return redirect(url_for('dashboard'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
       return render_template('login.html')
    if request.method == 'POST':
       
        mobile = request.form['mobile']
        password = request.form['password']
       

        # Search for user
        cursor.execute("SELECT * FROM users WHERE mobile = %s AND password = %s", (mobile, password))
        user = cursor.fetchone()

        if user:
            session.permanent = True
            session['mobile'] = mobile  # Store mobile in session
            session['name'] = user[1]
            session['id'] = user[2]
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))  # Redirect to dashboard or home page
        else:
            flash('Invalid mobile number or password.', 'error')
            return redirect(url_for('login'))
        
# Update balance

def update_user_balance(mobile, amount_to_add):
    try:
        cursor.execute(
            "UPDATE users SET balance = %s WHERE mobile = %s",
            (amount_to_add, mobile)
        )
        db.commit()
        return True
    except Exception as e:
        
        return False


@app.route('/api/update_balance', methods=['POST'])
def update_balance():
    
    if 'mobile' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    mobile = session['mobile']
    data = request.json  # get JSON payload

    amount_to_add = data.get('amount', 0)

    if amount_to_add == 0:
        return jsonify({'error': 'Invalid amount'}), 400

    success = update_user_balance(mobile, amount_to_add)

    if success:
        return jsonify({'message': 'Balance updated successfully!'})
    else:
        return jsonify({'error': 'Failed to update balance.'}), 500
        


    
@app.route('/dashboard', methods=['GET'])
def dashboard():
   if ('mobile' in session) :
       return render_template('index.html')
   else :
       return redirect(url_for('signup'))
   
@app.route('/profile', methods=['GET'])
def profile():  
   if 'mobile' in session:
     return render_template('profile.html')
   else :
       return redirect(url_for('signup'))
   
@app.route('/api/profile', methods=['GET'])
def get_profile():
    
    if 'mobile' in session:
         user_data = {
          'name': session.get('name'),
          'id': session.get('id'),
          'mobile': session.get('mobile')
          }
    
         

         return jsonify(user_data)
    else :
        return jsonify({'error': 'Unauthorized'}), 401
    
@app.route('/transaction', methods=['GET'])
def transaction():
    
    if 'mobile' in session: 
           return render_template('transaction.html')
    else :
        return redirect(url_for('signup'))
    
@app.route('/api/customer-support-link', methods=['GET'])
def get_customer_support_link():
    
    try:
        cursor = db.cursor()
        cursor.execute("SELECT customer_care FROM website_status WHERE id = 1")  # Assuming id=1 always
        result = cursor.fetchone()
        cursor.close()

        if result and result[0]:
            link = result[0]
            
            return jsonify({'link': link})
        else:
            
            return jsonify({'link': None})
    except Exception as e:
        
        return jsonify({'error': str(e)}), 500


@app.route('/recharge', methods=['GET'])
def recharge():
   if ('mobile' in session) :
       return render_template('recharge.html')
   else :
       return redirect(url_for('signup'))    
   
@app.route('/api/get_recharge_data', methods=['GET'])
def get_recharge_data():
    
    try:
        cursor = db.cursor()
        cursor.execute("SELECT amount1, amount2, qr_code_link, upi_id FROM website_status WHERE id = 1")  # Assuming id=1 always
        result = cursor.fetchone()
        cursor.close()

        if result:
            recharge_data = {
                'amount1': result[0],
                'amount2': result[1],
                'qr_code_link': result[2],
                'upi_id': result[3]
            }
            
            return jsonify(recharge_data)
        else:
            
            return jsonify({'error': 'No data found'}), 404
    except Exception as e:
        print("ERROR FETCHING RECHARGE DATA:", str(e))
        return jsonify({'error': str(e)}), 500
    
@app.route('/recharge', methods=['POST'])
def confirm_recharge():
    try:
        amount = float(request.form.get('amount'))
        utr_number = request.form.get('utr_number')

        cursor = db.cursor()

        # Update website_status: increment transaction and revenue
        cursor.execute("UPDATE website_status SET transaction = transaction + 1, revenue = revenue + %s WHERE id = 1", (amount,))
        
        # Optional: Insert this recharge into a `recharges` table if you have it (for history)
        # cursor.execute("INSERT INTO recharges (amount, utr_number, status) VALUES (%s, %s, %s)", (amount, utr_number, 'pending'))

        db.commit()
        cursor.close()

        flash('✅ Payment is in pending will be confirmed within 30 minutes.', 'success')
        return redirect(url_for('recharge'))  # ya jaha bhi tum redirect karna chaahte ho

    except Exception as e:
        print("Error in confirm_recharge:", str(e))
        flash('Something went wrong. Please try again.', 'error')
        return redirect(url_for('recharge'))   


    
if __name__ == '__main__':
    app.run(debug=True)


# Define routes here as you did previously...

