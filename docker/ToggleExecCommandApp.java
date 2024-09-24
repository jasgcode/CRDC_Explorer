import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class ToggleExecCommandApp extends JFrame {
    private JRadioButton fijiRadioButton, quPathRadioButton;

    private static final String DESKTOP_FILE_PATH = "/usr/share/applications/fiji.desktop";
    private static final String EXEC_OPTION_FIJI = "Exec=/fiji_macro.sh %F";
    private static final String EXEC_OPTION_QU_PATH = "Exec=qupath %F";

    public ToggleExecCommandApp() {
        setTitle("Toggle Exec Command");
        setSize(400, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Create radio buttons
        fijiRadioButton = new JRadioButton("Fiji");
        quPathRadioButton = new JRadioButton("QuPath");

        // Set default selection
        fijiRadioButton.setSelected(true);

        // Create button group
        ButtonGroup group = new ButtonGroup();
        group.add(fijiRadioButton);
        group.add(quPathRadioButton);

        // Add action listeners to radio buttons
        fijiRadioButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                updateDesktopFile(EXEC_OPTION_FIJI);
            }
        });

        quPathRadioButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                updateDesktopFile(EXEC_OPTION_QU_PATH);
            }
        });

        // Create panel and add components
        JPanel panel = new JPanel();
        panel.add(fijiRadioButton);
        panel.add(quPathRadioButton);

        // Set layout and add panel to frame
        setLayout(new BoxLayout(getContentPane(), BoxLayout.Y_AXIS));
        add(panel);

        // Make the frame visible
        setVisible(true);
    }

    private void updateDesktopFile(String newExecOption) {
        File desktopFile = new File(DESKTOP_FILE_PATH);

        try {
            // Read the content of the desktop file
            BufferedReader reader = new BufferedReader(new FileReader(desktopFile));
            StringBuilder content = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }

            reader.close();

            // Update the Exec option
            String regex = "Exec=[^\\n]+ ";
            content = new StringBuilder(content.toString().replaceAll(regex, newExecOption));

            // Write the modified content back to the desktop file
            FileWriter writer = new FileWriter(desktopFile);
            writer.write(content.toString());
            writer.close();

            // Display a confirmation message
            JOptionPane.showMessageDialog(this, "Exec command updated successfully.");

        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Error updating Exec command.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new ToggleExecCommandApp();
            }
        });
    }
}
